import { getUsers } from "../../../src/handlers/users"
import { prismaMock } from "../../singleton"

describe('Users Handlers', () => {
  describe('get users', () => {
    test('given a set of IDs in the query string, looks up users by ID', async () => {
      await getUsers(
        { query: { ids: [ 1, 3, 4 ] } } as any,
        {} as any
      )

      expect(prismaMock.user.findMany)
        .toHaveBeenCalledWith({ where: { id: { in: [ 1, 3, 4 ] } } })
    })

    test('given an empty query string, looks up all users', async () => {
      await getUsers(
        { query: {} } as any,
        {} as any
      )

      expect(prismaMock.user.findMany)
        .toHaveBeenCalledWith()
    })

    test('returns correct value', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([])

      const result = await getUsers(
        { query: {} } as any,
        {} as any
      )

      expect(result).toEqual({ data: [] })
    })
  })
})
